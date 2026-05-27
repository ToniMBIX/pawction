<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MailerSendService
{
    public function send(string $to, string $subject, string $html): bool
    {
        $apiKey = env('MAILERSEND_API_KEY');

        if (!$apiKey) {
            Log::warning('MAILERSEND_API_KEY no configurada');
            return false;
        }

        $fromEmail = env('MAIL_FROM_ADDRESS', 'hello@pawction.local');
        $fromName = env('MAIL_FROM_NAME', 'Pawction');

        try {
            $response = Http::withToken($apiKey)
                ->acceptJson()
                ->post('https://api.mailersend.com/v1/email', [
                    'from' => [
                        'email' => $fromEmail,
                        'name' => $fromName,
                    ],
                    'to' => [
                        [
                            'email' => $to,
                        ],
                    ],
                    'subject' => $subject,
                    'html' => $html,
                ]);

            if (!$response->successful()) {
                Log::warning('Error MailerSend API', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::warning('Excepción MailerSend API', [
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }
}