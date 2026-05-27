<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SupabaseStorageService
{
    private string $url;
    private string $key;
    private string $bucket;

    public function __construct()
    {
        $this->url = rtrim(env('SUPABASE_URL'), '/');
        $this->key = env('SUPABASE_SERVICE_ROLE_KEY');
        $this->bucket = env('SUPABASE_STORAGE_BUCKET', 'pawction');
    }

    public function uploadUploadedFile(UploadedFile $file, string $folder): string
    {
        $extension = $file->getClientOriginalExtension();
        $name = uniqid('', true) . '_' . time() . '.' . $extension;
        $path = trim($folder, '/') . '/' . $name;

        $response = Http::withToken($this->key)
            ->withHeaders([
                'apikey' => $this->key,
                'x-upsert' => 'true',
                'Content-Type' => $file->getMimeType() ?: 'application/octet-stream',
            ])
            ->withBody(
                file_get_contents($file->getRealPath()),
                $file->getMimeType() ?: 'application/octet-stream'
            )
            ->post(
                "{$this->url}/storage/v1/object/{$this->bucket}/{$path}"
            );

        if (!$response->successful()) {
            Log::error('Error subiendo archivo a Supabase Storage', [
                'status' => $response->status(),
                'body' => $response->body(),
                'path' => $path,
            ]);

            throw new \RuntimeException('No se pudo subir el archivo a Supabase Storage');
        }

        return $this->publicUrl($path);
    }

    public function uploadContent(string $content, string $path, string $mime): string
    {
        $path = ltrim($path, '/');

        $response = Http::withToken($this->key)
            ->withHeaders([
                'apikey' => $this->key,
                'x-upsert' => 'true',
                'Content-Type' => $mime,
            ])
            ->withBody($content, $mime)
            ->post(
                "{$this->url}/storage/v1/object/{$this->bucket}/{$path}"
            );

        if (!$response->successful()) {
            Log::error('Error subiendo contenido a Supabase Storage', [
                'status' => $response->status(),
                'body' => $response->body(),
                'path' => $path,
            ]);

            throw new \RuntimeException('No se pudo subir el contenido a Supabase Storage');
        }

        return $this->publicUrl($path);
    }

    public function publicUrl(string $path): string
    {
        $path = ltrim($path, '/');

        return "{$this->url}/storage/v1/object/public/{$this->bucket}/{$path}";
    }
}