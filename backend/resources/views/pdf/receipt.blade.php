<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Recibo Pawction</title></head>
<body>
<h1>Confirmación de pago</h1>
<p>Usuario: {{ $user->name }} ({{ $user->email }})</p>
<p>Subasta: {{ $auction->title }}</p>
<p>Precio final: {{ $auction->current_price }} €</p>
<hr>
<p>Reparto solidario:</p>
<ul>
  <li>Pawction: {{ $amount_pawction }} €</li>
  <li>Greenpeace: {{ $amount_greenpeace }} €</li>
</ul>
</body>
</html>
