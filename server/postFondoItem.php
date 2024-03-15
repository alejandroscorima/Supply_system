
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



$jsonFondoItem = json_decode(file_get_contents("php://input"));
if (!$jsonFondoItem) {
    exit("No hay datos");
}
$bd = include_once "bdLogistica.php";
$sentencia = $bd->prepare("insert into fondoitems(campus,fecha,tipo_doc,serie,numero,ruc,raz_social,monto,categoria,estado,liquidacion_id, user_id, orden_id) values (?,?,?,?,?,?,?,?,?,?,?,?,?)");
$resultado = $sentencia->execute([$jsonFondoItem->campus, $jsonFondoItem->fecha, $jsonFondoItem->tipo_doc, $jsonFondoItem->serie, $jsonFondoItem->numero, $jsonFondoItem->ruc, $jsonFondoItem->raz_social, $jsonFondoItem->monto, $jsonFondoItem->categoria, $jsonFondoItem->estado, $jsonFondoItem->liquidacion_id, $jsonFondoItem->user_id, $jsonFondoItem->orden_id]);
echo json_encode([
    "resultado" => $resultado,
]);
