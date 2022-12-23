
<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: DELETE");
$metodo = $_SERVER["REQUEST_METHOD"];
if ($metodo != "DELETE" && $metodo != "OPTIONS") {
    exit("Solo se permite método DELETE");
}

if (empty($_GET["session_id"])) {
    exit("No hay sesion");
}
$session_id = $_GET["session_id"];
$bd = include_once "bdLogistica.php";
$sentencia = $bd->prepare("DELETE FROM sessions WHERE id = ?");
$resultado = $sentencia->execute([$session_id]);
echo json_encode($resultado);
