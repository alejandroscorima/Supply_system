
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



$jsonReqDet = json_decode(file_get_contents("php://input"));
if (!$jsonReqDet) {
    exit("No hay datos");
}
$bd = include_once "bdLogistica.php";
$sentencia = $bd->prepare("insert into req_detalles(req_codigo, cantidad, descripcion, tipo, estado, image_url, pdf_url, id_asignado, obs, f_inicio, h_inicio, unit_budget, subtotal_budget, req_id) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
$resultado = $sentencia->execute([$jsonReqDet->req_codigo, $jsonReqDet->cantidad, $jsonReqDet->descripcion, $jsonReqDet->tipo, $jsonReqDet->estado, $jsonReqDet->image_url, $jsonReqDet->pdf_url, $jsonReqDet->id_asignado, $jsonReqDet->obs, $jsonReqDet->f_inicio, $jsonReqDet->h_inicio, $jsonReqDet->unit_budget, $jsonReqDet->subtotal_budget, $jsonReqDet->req_id]);
echo json_encode([
    "resultado" => $resultado,
]);
