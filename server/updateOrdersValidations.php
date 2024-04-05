<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: *");

// Verificar que la solicitud sea de tipo PUT
if ($_SERVER["REQUEST_METHOD"] != "PUT") {
    exit("Solo acepto peticiones PUT");
}

// Decodificar los datos JSON recibidos en la solicitud PUT
$jsonData = json_decode(file_get_contents("php://input"));

// Verificar que se recibieron datos válidos
if (!$jsonData) {
    exit("No hay datos");
}

// Incluir el archivo de conexión a la base de datos
$bd = include_once "bdLogistica.php";

// Preparar la consulta SQL para actualizar datos en la tabla orders_validations
$sentencia = $bd->prepare("UPDATE orders_validations SET user_id = ?, order_id = ?, date = ?, hour = ?, state = ? WHERE id = ?");

// Ejecutar la consulta SQL con los valores recibidos en la solicitud JSON
$resultado = $sentencia->execute([
    $jsonData->user_id,
    $jsonData->order_id,
    $jsonData->date,
    $jsonData->hour,
    $jsonData->state,
    $jsonData->id
]);

// Preparar la respuesta en formato JSON con el resultado de la actualización
echo json_encode(["resultado" => $resultado]);
?>
