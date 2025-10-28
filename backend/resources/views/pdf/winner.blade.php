<html>
  <body>
    <h2>Confirmación de ganador - Pawction</h2>
    <p>Subasta: {{ $auction->title }}</p>
    <p>Precio final: {{ number_format($auction->current_price,2) }} €</p>
    <p>Animal: {{ $auction->product->animal->name ?? 'N/D' }}</p>
    <p>Escanea este QR para más información.</p>
    <img src="{{ storage_path('app/qr/auction_'.$auction->id.'.png') }}" width="180"/>
  </body>
</html>
