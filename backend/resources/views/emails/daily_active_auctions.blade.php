<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Pawction - Subastas activas</title>
</head>
<body style="margin:0; padding:0; background:#f4f4f7; font-family:Arial, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7; padding:25px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:white; border-radius:12px; overflow:hidden;">
<tr>
<td style="background:#1e1e2f; padding:25px; text-align:center;">
<h1 style="color:white; margin:0; font-size:26px;">Subastas activas</h1>
</td>
</tr>
<tr>
<td style="padding:30px 40px; color:#333; font-size:16px; line-height:1.6;">
<p>Resumen diario de subastas que siguen activas en Pawction.</p>

@if($auctions->count() === 0)
    <p>No hay subastas activas actualmente.</p>
@else
    @foreach($auctions as $auction)
        <div style="border-bottom:1px solid #e5e5e5; padding:15px 0;">
            <strong>{{ $auction->title }}</strong><br>
            Precio actual: {{ $auction->current_price }} €<br>
            Finaliza: {{ optional($auction->end_at)->format('d/m/Y H:i') }}<br>
            ID: {{ $auction->id }}
        </div>
    @endforeach
@endif

<p style="text-align:center; margin-top:30px;">
🐾 Pawction — seguimiento automático diario.
</p>
</td>
</tr>
<tr>
<td style="background:#1e1e2f; color:white; text-align:center; padding:20px;">
<p style="margin:0; font-size:13px; opacity:0.8;">
© {{ date('Y') }} Pawction — 50/50 Pawction / Greenpeace
</p>
</td>
</tr>
</table>
</td></tr>
</table>
</body>
</html>