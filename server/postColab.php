<?php
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    exit("Solo acepto peticiones POST");
}

$jsonColab = json_decode(file_get_contents("php://input"));
if (!$jsonColab) {
    exit("No hay datos");
}

$bd = include_once "bdData.php";

try {
    $sentencia = $bd->prepare("INSERT INTO collaborators (user_id, area_id, campus_id, position, raz_social, situation, service_unit, type_area, admission_date, cessation_date, colab_code) VALUES (?,?,?,?,?,?,?,?,?,?,?)");

    $resultado = $sentencia->execute([$jsonColab->user_id, $jsonColab->area_id, $jsonColab->campus_id, $jsonColab->position, $jsonColab->raz_social, $jsonColab->situation, $jsonColab->service_unit, $jsonColab->type_area, $jsonColab->admission_date, $jsonColab->cessation_date, $jsonColab->colab_code]);

    echo json_encode([
        "resultado" => $resultado,
    ]);
} catch (PDOException $e) {
    // Captura y muestra el mensaje de error en caso de excepción
    echo json_encode([
        "error" => "Error en la ejecución de la consulta: " . $e->getMessage(),
    ]);
}
?>
