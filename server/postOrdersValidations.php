<?php
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

// Incluir el archivo de conexión a la base de datos
$bd = include_once "bdLogistica.php";

// Preparar la consulta SQL para insertar datos en la tabla orders_validations
$sentencia = $bd->prepare("INSERT INTO orders_validations (user_id, order_id, date, hour, state) VALUES (?, ?, ?, ?, ?)");

// Ejecutar la consulta SQL con los valores recibidos en la solicitud JSON
$resultado = $sentencia->execute([
    $jsonReq->user_id,
    $jsonReq->order_id,
    $jsonReq->date,
    $jsonReq->hour,
    $jsonReq->state
]);

// Preparar la respuesta en formato JSON con el resultado de la inserción
echo json_encode([
    "resultado" => $resultado
]);
?>
