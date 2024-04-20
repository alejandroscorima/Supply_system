<?php
// Permitir acceso desde cualquier origen
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: POST');

// Verificar que la petición sea POST
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    exit("Solo acepto peticiones POST");
}

// Leer datos JSON de la solicitud
$jsonFolder = json_decode(file_get_contents("php://input"));

// Verificar si se recibieron datos
if (!$jsonFolder) {
    exit("No se recibieron datos");
}

// Incluir la conexión a la base de datos
$bd = include_once "bdPaperLess.php";

// Preparar la consulta de inserción en la tabla `folder`
$sentencia = $bd->prepare("INSERT INTO folder (name, description, isShared) VALUES (?, ?, ?)");

// Ejecutar la consulta con los datos recibidos
$resultado = $sentencia->execute([$jsonData->name, $jsonData->description, $jsonData->isShared]);

// Preparar la respuesta en formato JSON
$response = [
    "resultado" => $resultado,
];

// Devolver la respuesta como JSON
echo json_encode($response);
