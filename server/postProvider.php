
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



$jsonReq = json_decode(file_get_contents("php://input"));
if (!$jsonReq) {
    exit("No hay datos");
}
$bd = include_once "bdLogistica.php";
$sentencia = $bd->prepare("insert into proveedores(ruc, razon_social, direccion, cci, estado, categoria) values (?,?,?,?,?,?)");
$resultado = $sentencia->execute([$jsonReq->ruc, $jsonReq->razon_social, $jsonReq->direccion, $jsonReq->cci, $jsonReq->estado, $jsonReq->categoria]);
echo json_encode([
    "resultado" => $resultado,
]);
