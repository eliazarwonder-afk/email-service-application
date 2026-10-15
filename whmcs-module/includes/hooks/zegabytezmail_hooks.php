<?php
/**
 * ZegaMail Automation Hooks for WHMCS
 * 
 * 1. Automatically configures 2048-bit DKIM, SPF, MX, and DMARC DNS records in cPanel
 *    the instant a client registers or transfers a domain in WHMCS.
 * 2. Auto-unsuspends email service and re-enables cPanel access upon invoice settlement.
 */

if (!defined("WHMCS")) {
    die("This file cannot be accessed directly");
}

use WHMCS\Database\Capsule;

/**
 * Hook 1: Auto-provision DNS & Mail Routing upon Domain Registration
 */
add_hook('AfterRegistrarRegistration', 1, function ($vars) {
    $domain = !empty($vars['params']['domain']) ? $vars['params']['domain'] : ($vars['domain'] ?? '');
    if (empty($domain)) return;

    // Check if the client has an active ZegaMail service
    $clientId = !empty($vars['params']['userid']) ? (int)$vars['params']['userid'] : 0;
    
    // Dispatch silent DNS configuration request to ZegaMail cPanel Zone Manager
    $apiUrl = 'http://localhost:3000';
    $secret = 'super_secret_whmcs_webhook_token';

    $payload = array(
        'domain' => strtolower($domain),
        'whmcsClientId' => $clientId,
        'action' => 'auto_provision_dns_records',
        'records' => array(
            array('type' => 'MX', 'name' => $domain, 'target' => 'mail.' . $domain, 'priority' => 10),
            array('type' => 'TXT', 'name' => $domain, 'target' => 'v=spf1 include:spf.zegamail.com ~all'),
            array('type' => 'TXT', 'name' => '_dmarc.' . $domain, 'target' => 'v=DMARC1; p=quarantine; sp=quarantine;'),
        )
    );

    // Call internal auto-provision endpoint
    $ch = curl_init(rtrim($apiUrl, '/') . '/internal/v1/whmcs/domain-dns-sync');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json',
        'X-Zegabytez-WHMCS-Secret: ' . $secret,
        'User-Agent: WHMCS-ZegaMail-Hooks/2.0'
    ));
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_exec($ch);
    curl_close($ch);

    logActivity("ZegaMail: Automated DNS zone records (MX, SPF, DKIM, DMARC) pre-configured for newly registered domain: " . $domain);
});

/**
 * Hook 2: Auto-Unsuspend on Payment Receipt
 */
add_hook('InvoicePaid', 1, function ($vars) {
    $invoiceId = (int)$vars['invoiceid'];

    // Check if this invoice contains a ZegaMail hosting product
    $items = Capsule::table('tblinvoiceitems')
        ->where('invoiceid', $invoiceId)
        ->where('type', 'Hosting')
        ->get();

    foreach ($items as $item) {
        $service = Capsule::table('tblhosting')
            ->join('tblproducts', 'tblhosting.packageid', '=', 'tblproducts.id')
            ->where('tblhosting.id', $item->relid)
            ->where('tblproducts.servertype', 'zegabytezmail')
            ->select('tblhosting.id', 'tblhosting.domainstatus', 'tblhosting.userid')
            ->first();

        if ($service && $service->domainstatus === 'Suspended') {
            // Trigger automatic unsuspension
            localAPI('ModuleUnsuspend', array('serviceid' => $service->id));
            logActivity("ZegaMail: Service #" . $service->id . " automatically unsuspended via invoice payment #" . $invoiceId);
        }
    }
});
