
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");


$bd = include_once "bdLogistica.php";

$sentencia = $bd->prepare("SELECT id, req_id, numero, ruc, razon_social, direccion, subtotal, igv, total, rebajado, fecha, destino, tipo, estado, empresa, moneda, area, destino_dir, tipo_pago, num_cuenta, retencion, retencion_percent, percepcion, receipt,txt, section FROM ordenes WHERE section='OFICINA' ORDER BY fecha DESC");


//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$orders = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($orders);

?>
