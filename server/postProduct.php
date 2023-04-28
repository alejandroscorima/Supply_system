
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

try{
    if (!$jsonReq) {
        exit("No hay datos");
    }
    $bd = include_once "bdLogistica.php";
    $sentencia = $bd->prepare("insert into products(codigo, descripcion, val_sis, um_sis, val_prov, um_prov, provider, unit_price, exonerado) values (?,?,?,?,?,?,?,?,?)");
    $resultado = $sentencia->execute([$jsonReq->codigo, $jsonReq->descripcion, $jsonReq->val_sis, $jsonReq->um_sis, $jsonReq->val_prov, $jsonReq->um_prov, $jsonReq->provider, $jsonReq->unit_price, $jsonReq->exonerado]);
    echo json_encode([
        "resultado" => $resultado,
    ]);
} catch (Exception $e) {
    echo $e->getMessage();
  }
