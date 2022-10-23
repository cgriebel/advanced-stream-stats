<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

use Braintree\Gateway;
use Exception;
use Illuminate\Support\Facades\Log;

class SubscriptionController extends Controller
{
    protected $gateway;

    // TODO: add abstration around gateway and inject via DI
    public function __construct()
    {
        $this->gateway =
            new Gateway([
                'environment' => 'sandbox',
                'merchantId' => '3zf8wt7grt2znn2h',
                'publicKey' => 'wbd3rmrh465vwrsd',
                'privateKey' => '03e10a341a2f3d26f119f30ab93c3ae5'
            ]);
    }

    public function load(Request $request)
    {
        $plans = $this->gateway->plan()->all();
        $count = count($plans);
        $clientToken = $this->gateway->clientToken()->generate([
            // "customerId" => $request->user()->customer_id
        ]);

        return response()->json([
            "user" => $request->user(), "token" =>
            $clientToken,
            "plans" => $plans
        ]);
    }

    public function add(Request $request)
    {
        $request->validate([
            'payment_nonce' => 'required',
            'plan_id' => 'required',
        ]);

        try {
            $nonce = $request->input('payment_nonce');
            $plan_id = $request->input('plan_id');
            if (true) {
                $result = $this->gateway->customer()->create([
                    'firstName' => 'Mike',
                    'lastName' => 'Jones',
                    'company' => 'Jones Co.',
                    'email' => 'mike.jones@example.com',
                    'phone' => '281.330.8004',
                    'fax' => '419.555.1235',
                    'website' => 'http://example.com',
                    'paymentMethodNonce' => $nonce
                ]);

                if ($result->success) {

                    $subscrptionResult = $this->gateway->subscription()->create([
                        'paymentMethodToken' => $result->customer->paymentMethods[0]->token,
                        'planId' => $plan_id,
                    ]);

                    $request->user()->customer_id = $result->customer->id;
                    $request->user()->save();

                    return response()->json(["success" => true, "customer_id" => $result->customer->id, "nonce" => $nonce, "token" => $result->customer->paymentMethods[0]->token, "sub" => $subscrptionResult]);
                } else {
                    // TODO Handle error
                }
            } else {
            }
        } catch (Exception $e) {
            //code to handle the exception
            return response()->json(["success" => false, "error"
            => $e, "msg" => $e->getMessage()]);
        }
    }
}
