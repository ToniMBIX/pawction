<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pawction - Pago Completado</title>
</head>

<body style="margin:0; padding:0; background:#f4f4f7; font-family:Arial, sans-serif;">

    <!-- CONTENEDOR -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7; padding:25px 0;">
        <tr>
            <td align="center">

                <!-- CAJA PRINCIPAL -->
                <table width="600" cellpadding="0" cellspacing="0" style="background:white; border-radius:12px; overflow:hidden;">

                    <!-- HEADER -->
                    <tr>
                        <td style="background:#1e1e2f; padding:25px; text-align:center;">
                            <img src="https://pawction-frontend.onrender.com/logo.png"
                                alt="Pawction"
                                style="width:70px; margin-bottom:10px;">
                            <h1 style="color:white; margin:0; font-size:26px; font-weight:700;">
                                ¡Pago completado!
                            </h1>
                        </td>
                    </tr>

                    <!-- CONTENIDO -->
                    <tr>
                        <td style="padding:30px 40px; color:#333; font-size:16px; line-height:1.6;">

                            <p style="margin-top:0;">
                                Hola <strong>{{ $auction->winner->name }}</strong>,
                            </p>

                            <p>
                                Gracias por tu compra en <strong>Pawction</strong>.  
                                Tu pago se ha procesado correctamente.
                            </p>

                            <h2 style="font-size:22px; margin:25px 0 10px 0; text-align:center;">
                                {{ $auction->product->title }}
                            </h2>

                            <!-- IMAGEN DEL PRODUCTO -->
                            <div style="text-align:center; margin:20px 0;">
                                <img src="{{ asset('storage/products/' . $auction->product->image) }}"
                                     alt="Producto"
                                     style="width:100%; max-width:420px; border-radius:10px;">
                            </div>

                            <p><strong>Total pagado:</strong> {{ $auction->current_price }} €</p>
                            <p><strong>ID de subasta:</strong> {{ $auction->id }}</p>

                            <hr style="border:none; height:1px; background:#e5e5e5; margin:30px 0;">

                            <h3 style="font-size:18px; text-align:center; margin-bottom:10px;">
                                Ficha del animal
                            </h3>

                            <p style="text-align:center;">
                                Escanea el siguiente código QR o usa el botón inferior:
                            </p>

                            <!-- QR -->
                            <div style="text-align:center; margin:20px 0;">
                                <img src="data:image/png;base64,{{ $qr }}" 
                                     style="width:160px; border-radius:8px;">
                            </div>

                            <!-- BOTÓN CTA -->
                            <div style="text-align:center; margin-top:20px;">
                                <a href="{{ url('/storage/animals/'.$auction->product->animal->pdf) }}"
                                   style="
                                       background:#2563eb;
                                       color:white;
                                       padding:12px 22px;
                                       border-radius:8px;
                                       text-decoration:none;
                                       font-size:16px;
                                       display:inline-block;
                                   "
                                   target="_blank">
                                   Ver ficha en PDF
                                </a>
                            </div>

                            <hr style="border:none; height:1px; background:#e5e5e5; margin:30px 0;">

                            <p style="text-align:center; font-size:15px;">
                                🐾 Gracias por apoyar a <strong>Pawction</strong>.  
                                Tu compra ayuda a proteger animales que lo necesitan. 💙  
                            </p>

                        </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                        <td style="background:#1e1e2f; color:white; text-align:center; padding:20px;">
                            <p style="margin:0; font-size:13px; opacity:0.8;">
                                © {{ date('Y') }} Pawction — 50/50 Pawction / Greenpeace
                            </p>
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>

</body>
</html>
