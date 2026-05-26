<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FakePaymentController extends Controller
{
    public function pay(Request $request)
    {
        return app(PaymentController::class)->fakeComplete($request);
    }
}