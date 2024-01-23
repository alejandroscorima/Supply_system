
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
// header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Methods: PUT");
// header("Access-Control-Allow-Methods: POST");
// header("Access-Control-Allow-Headers: *");

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    exit("Solo acepto peticiones POST");
}



$jsonEntregaItem = json_decode(file_get_contents("php://input"));
if (!$jsonEntregaItem) {
    exit("No hay datos");
}
$bd = include_once "bdLogistica.php";
$sentencia = $bd->prepare("insert into entregaitems(campus,fecha,tipo_doc,serie,numero,ruc,raz_social,monto,categoria,estado,liquidacion_id, user_id, orden_id) values (?,?,?,?,?,?,?,?,?,?,?,?,?)");
$resultado = $sentencia->execute([$jsonEntregaItem->campus, $jsonEntregaItem->fecha, $jsonEntregaItem->tipo_doc, $jsonEntregaItem->serie, $jsonEntregaItem->numero, $jsonEntregaItem->ruc, $jsonEntregaItem->raz_social, $jsonEntregaItem->monto, $jsonEntregaItem->categoria, $jsonEntregaItem->estado, $jsonEntregaItem->liquidacion_id, $jsonEntregaItem->user_id, $jsonEntregaItem->orden_id]);
echo json_encode([
    "resultado" => $resultado,
]);
