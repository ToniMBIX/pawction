<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pawction - Subasta finalizada</title>
</head>

<body style="margin:0; padding:0; background:#f4f4f7; font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7; padding:25px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:white; border-radius:12px; overflow:hidden;">
                    <tr>
                        <td style="background:#1e1e2f; padding:25px; text-align:center;">
                            <h1 style="color:white; margin:0; font-size:26px; font-weight:700;">
                                ¡Subasta finalizada!
                            </h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:30px 40px; color:#333; font-size:16px; line-height:1.6;">
                            <p style="margin-top:0;">
                                Hola,
                            </p>

                            <p>
                                Una subasta en la que participabas ha finalizado en <strong>Pawction</strong>.
                            </p>

                            <h2 style="font-size:22px; margin:25px 0 10px 0; text-align:center;">
                                <?php echo e($auction->product->name ?? $auction->title ?? 'Artículo subastado'); ?>

                            </h2>

                            <p><strong>Precio final:</strong> <?php echo e($auction->current_price); ?> €</p>
                            <p><strong>ID de subasta:</strong> <?php echo e($auction->id); ?></p>
                            <p><strong>Estado:</strong> <?php echo e($auction->status); ?></p>

                            <hr style="border:none; height:1px; background:#e5e5e5; margin:30px 0;">

                            <p style="text-align:center; font-size:15px;">
                                🐾 Gracias por participar en <strong>Pawction</strong>.  
                                Cada puja ayuda a apoyar causas solidarias. 💙
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="background:#1e1e2f; color:white; text-align:center; padding:20px;">
                            <p style="margin:0; font-size:13px; opacity:0.8;">
                                © <?php echo e(date('Y')); ?> Pawction — 50/50 Pawction / Greenpeace
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html><?php /**PATH C:\Users\toni-\pawction\pawction\backend\resources\views/emails/auction_finished.blade.php ENDPATH**/ ?>