
<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: DELETE");
$metodo = $_SERVER["REQUEST_METHOD"];
if ($metodo != "DELETE" && $metodo != "OPTIONS") {
    exit("Solo se permite método DELETE");
}

$id = $_GET["id"];
$bd = include_once "bdLogistica.php";
$sentencia = $bd->prepare("DELETE FROM activities WHERE id = ?");
$resultado = $sentencia->execute([$id]);
echo json_encode($resultado);
