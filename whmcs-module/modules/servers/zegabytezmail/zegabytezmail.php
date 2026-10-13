<?php
/**
 * Zegabytez Mail — WHMCS Server Provisioning Module
 * 
 * Enables Zegabytez Cloud to provision dedicated business email organizations,
 * assign mailboxes, manage quotas, and provide one-click SSO into Zegabytez Mail.
 */

if (!defined("WHMCS")) {
    die("This file cannot be accessed directly");
}

function zegabytezmail_MetaData()
{
    return array(
        'DisplayName' => 'Zegabytez Mail',
        'APIVersion' => '1.1',
        'RequiresServer' => false,
        'DefaultNonSSLPort' => '4000',
        'DefaultSSLPort' => '4000',
    );
}

function zegabytezmail_ConfigOptions()
{
    return array(
        'API URL' => array(
            'Type' => 'text',
            'Size' => '50',
            'Default' => 'http://localhost:4000',
            'Description' => 'The base URL for Zegabytez Mail API (e.g. https://api.zegabytez.com)',
        ),
        'Webhook Secret' => array(
            'Type' => 'password',
            'Size' => '50',
            'Default' => 'super_secret_whmcs_webhook_token',
            'Description' => 'Matching WHMCS_INTERNAL_WEBHOOK_SECRET in Zegabytez Mail API .env',
        ),
        'Package Plan' => array(
            'Type' => 'text',
            'Size' => '30',
            'Default' => 'zegabytez-mail-pro',
            'Description' => 'Plan identifier (e.g. standard, pro, enterprise)',
        ),
        'Max Mailboxes' => array(
            'Type' => 'text',
            'Size' => '10',
            'Default' => '5',
            'Description' => 'Number of email accounts allowed for this package',
        ),
        'Storage Quota (MB)' => array(
            'Type' => 'text',
            'Size' => '10',
            'Default' => '25000',
            'Description' => 'Total storage allocation across mailboxes in MB',
        ),
    );
}

/**
 * Helper to perform HTTP POST to Zegabytez Mail API
 */
function zegabytezmail_ApiRequest($endpoint, $payload, $apiUrl, $secret)
{
    $url = rtrim($apiUrl, '/') . $endpoint;
    $ch = curl_init($url);
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json',
        'X-Zegabytez-WHMCS-Secret: ' . $secret,
        'User-Agent: WHMCS-ZegabytezMail/1.0'
    ));
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        return array('success' => false, 'error' => 'cURL Error: ' . $curlError);
    }

    $data = json_decode($response, true);
    if ($httpCode >= 200 && $httpCode < 300) {
        return array('success' => true, 'data' => $data);
    }

    $msg = isset($data['message']) ? $data['message'] : (isset($data['error']) ? json_encode($data['error']) : 'HTTP ' . $httpCode);
    return array('success' => false, 'error' => $msg);
}

/**
 * Provision new service on Order Acceptance / Payment
 */
function zegabytezmail_CreateAccount(array $params)
{
    $apiUrl = $params['configoption1'];
    $secret = $params['configoption2'];
    $plan = $params['configoption3'];
    $maxMailboxes = (int)$params['configoption4'];
    $storageMb = (int)$params['configoption5'];

    $payload = array(
        'orderId' => 'WHMCS-' . $params['serviceid'],
        'whmcsClientId' => (int)$params['clientsdetails']['userid'],
        'clientEmail' => $params['clientsdetails']['email'],
        'clientName' => trim($params['clientsdetails']['firstname'] . ' ' . $params['clientsdetails']['lastname']),
        'packagePlan' => $plan,
        'maxMailboxes' => $maxMailboxes > 0 ? $maxMailboxes : 5,
        'storageLimitMb' => $storageMb > 0 ? $storageMb : 25000,
        'primaryDomain' => !empty($params['domain']) ? $params['domain'] : null,
    );

    $res = zegabytezmail_ApiRequest('/internal/v1/whmcs/provision', $payload, $apiUrl, $secret);

    if ($res['success']) {
        return 'success';
    }

    return 'Zegabytez Mail Provisioning Failed: ' . $res['error'];
}

/**
 * Suspend service (Overdue Invoice)
 */
function zegabytezmail_SuspendAccount(array $params)
{
    $apiUrl = $params['configoption1'];
    $secret = $params['configoption2'];

    $payload = array(
        'whmcsClientId' => (int)$params['clientsdetails']['userid'],
    );

    $res = zegabytezmail_ApiRequest('/internal/v1/whmcs/suspend', $payload, $apiUrl, $secret);
    return $res['success'] ? 'success' : $res['error'];
}

/**
 * Unsuspend service (Invoice Settled)
 */
function zegabytezmail_UnsuspendAccount(array $params)
{
    $apiUrl = $params['configoption1'];
    $secret = $params['configoption2'];

    $payload = array(
        'whmcsClientId' => (int)$params['clientsdetails']['userid'],
    );

    $res = zegabytezmail_ApiRequest('/internal/v1/whmcs/unsuspend', $payload, $apiUrl, $secret);
    return $res['success'] ? 'success' : $res['error'];
}

/**
 * Terminate service
 */
function zegabytezmail_TerminateAccount(array $params)
{
    $apiUrl = $params['configoption1'];
    $secret = $params['configoption2'];

    $payload = array(
        'whmcsClientId' => (int)$params['clientsdetails']['userid'],
    );

    $res = zegabytezmail_ApiRequest('/internal/v1/whmcs/terminate', $payload, $apiUrl, $secret);
    return $res['success'] ? 'success' : $res['error'];
}

/**
 * Custom Client Area Buttons
 */
function zegabytezmail_ClientAreaCustomButtonArray()
{
    return array(
        'Log in to Zegabytez Mail' => 'loginToZegabytezMail',
    );
}

/**
 * One-Click SSO redirect from WHMCS Client Area
 */
function zegabytezmail_loginToZegabytezMail(array $params)
{
    $apiUrl = $params['configoption1'];
    $secret = $params['configoption2'];

    $payload = array(
        'whmcsClientId' => (int)$params['clientsdetails']['userid'],
        'email' => $params['clientsdetails']['email'],
        'name' => trim($params['clientsdetails']['firstname'] . ' ' . $params['clientsdetails']['lastname']),
    );

    $res = zegabytezmail_ApiRequest('/internal/v1/whmcs/sso-token', $payload, $apiUrl, $secret);

    if ($res['success'] && !empty($res['data']['ssoUrl'])) {
        header("Location: " . $res['data']['ssoUrl']);
        exit;
    }

    return 'Unable to generate single sign-on token: ' . (isset($res['error']) ? $res['error'] : 'Unknown error');
}
