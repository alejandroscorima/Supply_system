<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: *");

if ($_SERVER["REQUEST_METHOD"] != "PUT") {
    exit("Solo acepto peticiones PUT");
}

$jsonFile = json_decode(file_get_contents("php://input"));

if (!$jsonFile) {
    exit("No hay datos");
}

$bd = include_once "bdPaperLess.php";

$sentencia = $bd->prepare("UPDATE file SET name = ?, url = ?, description = ?, extention = ?, date = ?, hour = ?, order_id = ?, folder_id = ? WHERE id = ?");

$resultado = $sentencia->execute([$jsonFile->name, $jsonFile->url, $jsonFile->description, $jsonFile->extension, $jsonFile->date, $jsonFile->hour, $jsonFile->order_id, $jsonFile->folder_id, $jsonFile->id]);

echo json_encode($resultado);
