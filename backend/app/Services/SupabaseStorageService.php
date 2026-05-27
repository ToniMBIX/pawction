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
    $this->url = 'https://kmidewazwlmleklpykfc.supabase.co';

    $this->key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttaWRld2F6d2xtbGVrbHB5a2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk5OTY1MiwiZXhwIjoyMDkzNTc1NjUyfQ.L-F3n5S4htDKXn9kl89v9p4Khg8KCHUu6QsUmoq2n98';

    $this->bucket = 'pawction';

    if (!$this->url || !$this->key || !$this->bucket) {
        throw new \RuntimeException(
            'Supabase Storage no está configurado.'
        );
    }
}

    public function uploadUploadedFile(UploadedFile $file, string $folder): string
    {
        $extension = $file->getClientOriginalExtension() ?: 'bin';
        $name = uniqid('', true) . '_' . time() . '.' . $extension;
        $path = trim($folder, '/') . '/' . $name;
        $mime = $file->getMimeType() ?: 'application/octet-stream';

        $response = Http::withToken($this->key)
            ->withHeaders([
                'apikey' => $this->key,
                'x-upsert' => 'true',
                'Content-Type' => $mime,
            ])
            ->withBody(
                file_get_contents($file->getRealPath()),
                $mime
            )
            ->post("{$this->url}/storage/v1/object/{$this->bucket}/{$path}");

        if (!$response->successful()) {
            Log::error('Error subiendo archivo a Supabase Storage', [
                'status' => $response->status(),
                'body' => $response->body(),
                'path' => $path,
            ]);

            throw new \RuntimeException(
                'No se pudo subir el archivo a Supabase Storage: ' . $response->body()
            );
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
            ->post("{$this->url}/storage/v1/object/{$this->bucket}/{$path}");

        if (!$response->successful()) {
            Log::error('Error subiendo contenido a Supabase Storage', [
                'status' => $response->status(),
                'body' => $response->body(),
                'path' => $path,
            ]);

            throw new \RuntimeException(
                'No se pudo subir el contenido a Supabase Storage: ' . $response->body()
            );
        }

        return $this->publicUrl($path);
    }

    public function publicUrl(string $path): string
    {
        $path = ltrim($path, '/');

        return "{$this->url}/storage/v1/object/public/{$this->bucket}/{$path}";
    }
}