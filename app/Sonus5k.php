<?php

namespace App;

use GuzzleHttp\Psr7;
use Illuminate\Database\Eloquent\Model;
use GuzzleHttp\Client as GuzzleHttpClient;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Cookie\FileCookieJar as FileCookieJar;

class Sonus5k extends Model
{
    // Sonus 5K REST API Functions

    public static function wrapapi($verb, $apiurl, $data = '')
    {
        // Wrapper for Guzzle API Calls
        $client = new GuzzleHttpClient();

        $headers = [
                            'auth'    => [env('SONUSUSER'), env('SONUSPASS')],
                            'verify'  => false,
                            'headers' => [
                                        'Content-Type'     => 'application/vnd.yang.data+json',
                                        'Accept'           => 'application/vnd.yang.data+xml',			// Changed to xml because Sonus is not supporting JSON - 042118 - TR
                                    ],
                        ];
        if ($verb == 'POST') {
            $headers['data'] = $data;
        }

        try {
            $apiRequest = $client->request($verb, $apiurl, $headers);
        } catch (\Exception $e) {
            return $e->getMessage();
        }

        // Sonus is not supporting JSON at this time so we have to use XML - they are limiting the return on JSON to 100 records.
        $xml = $apiRequest->getBody()->getContents();

        // Try to convert the xml into an array.
        $xml = simplexml_load_string($xml);
        $json = json_encode($xml);

        return json_decode($json, true);

        //return json_decode($apiRequest->getBody()->getContents(), true);
    }

    public static function configbackup($SBC)
    {
        $verb = 'POST';
        $apiurl = "https://{$SBC}/api/config/system/admin/{$SBC}/_operations/saveConfig";
        $result = self::wrapapi($verb, $apiurl);

        return $result;
    }

    /*
    public static function listactivecalls()
    {
        $SBCS = [
                    env('SONUS1'),
                    env('SONUS2'),
        ];

        $CALLS = [];
        foreach ($SBCS as $SBC) {
            $URL = $SBC;
            $verb = "GET";
            $apiurl = "https://{$SBC}/api/operational/global/callSummaryStatus/";
            $result = self::wrapapi($verb, $apiurl);
            $CALLS[$SBC] = $result ;
        }

        return $CALLS;
    }
    */

    public static function getactivecallstats($SBC)
    {
        $verb = 'GET';
        $apiurl = "https://{$SBC}/api/operational/global/callCountStatus/activeCalls";

        return self::wrapapi($verb, $apiurl);
    }

    public static function listactivecalls($SBC)
    {
        $verb = 'GET';
        $apiurl = "https://{$SBC}/api/operational/global/callSummaryStatus/";

        $response = self::wrapapi($verb, $apiurl);

        // We just want to return an array of calls.
        if (($response['callSummaryStatus']) && array_key_exists('GCID', $response['callSummaryStatus'])) {
            // Wrap the single object in an array - found GCID key inside CallSummaryStatus
            return [$response['callSummaryStatus']];
        } else {
            return $response['callSummaryStatus'];
        }

        //return self::wrapapi($verb, $apiurl);
    }

    public static function listactivealarms($SBC)
    {
        $verb = 'GET';
        $apiurl = "https://{$SBC}/api/operational/alarms/currentStatus";

        $response = self::wrapapi($verb, $apiurl);

        // We just want to return an array of alarms.
        if (($response['currentStatus']) && array_key_exists('alarmId', $response['currentStatus'])) {
            // Wrap the single object in an array - found GCID key inside CallSummaryStatus
            return [$response['currentStatus']];
        } else {
            return $response['currentStatus'];
        }

        //return self::wrapapi($verb, $apiurl);
    }

    public static function listcallDetailStatus($SBC)
    {
        $verb = 'GET';
        $apiurl = "https://{$SBC}/api/operational/global/callDetailStatus";

        $response = self::wrapapi($verb, $apiurl);
        //return $response;

        // We just want to return an array of calls.
        if (($response['callDetailStatus']) && array_key_exists('GCID', $response['callDetailStatus'])) {
            // Wrap the single object in an array - found GCID key inside CallSummaryStatus
            return [$response['callDetailStatus']];
        } else {
            return $response['callDetailStatus'];
        }

        //return self::wrapapi($verb, $apiurl);
    }

    public static function listcallMediaStatus($SBC)
    {
        $verb = 'GET';
        $apiurl = "https://{$SBC}/api/operational/global/callMediaStatus";

        // Example Call by GCID
        // $apiurl = https://{$SBC}/api/operational/global/callMediaStatus/34782

        //return self::wrapapi($verb, $apiurl);

        $response = self::wrapapi($verb, $apiurl);

        // We just want to return an array of calls.
        if (($response['callMediaStatus']) && array_key_exists('GCID', $response['callMediaStatus'])) {
            // Wrap the single object in an array - found GCID key inside CallSummaryStatus
            return [$response['callMediaStatus']];
        } else {
            return $response['callMediaStatus'];
        }
    }

    /*
    public static function removeconfigbackup($SBC, $LOCATION)
    {
        $LOCATION = ['data' => $LOCATION];
        $verb = "POST";
        $apiurl = "https://{$SBC}/api/config/system/admin/{$SBC}/_operations/saveConfig";
        $result = self::wrapapi($verb, $apiurl, $LOCATION);
        print "REMOVED ".$LOCATION;
        print_r($result);
        return $result;
    }
    */
}
