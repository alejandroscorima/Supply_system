
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: *");
if ($_SERVER["REQUEST_METHOD"] != "PUT") {
    exit("Solo acepto peticiones PUT");
}
$jsonColab = json_decode(file_get_contents("php://input"));
if (!$jsonColab) {
    exit("No hay datos");
}
$bd = include_once "bdData.php";
$sentencia = $bd->prepare("UPDATE collaborators SET area_id = ?, campus_id = ?, position = ?, raz_social = ?, situation = ?, service_unit = ?, type_area = ?, admission_date = ?, cessation_date = ?, colab_code = ? WHERE colab_id = ?");
$resultado = $sentencia->execute([$jsonColab->area_id, $jsonColab->campus_id, $jsonColab->position, $jsonColab->raz_social, $jsonColab->situation, $jsonColab->service_unit, $jsonColab->type_area, $jsonColab->admission_date, $jsonColab->cessation_date, $jsonColab->colab_code, $jsonColab->colab_id]);
echo json_encode($resultado);


