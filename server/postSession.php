
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



 $jsonSes = json_decode(file_get_contents("php://input"));
/*if (!$jsonSes) {
    exit("No hay datos");
}
$bd = include_once "bdLogistica.php";
$sentencia = $bd->prepare("insert into sessions(user_id, created, expires) values (?,?,?)");
$resultado = $sentencia->execute([$jsonSes->user_id, $jsonSes->created, $jsonSes->expires]);
if ($resultado === TRUE) {
  $resultado = $sentencia->insert_id;
} */

$link = mysqli_connect('localhost', 'root', 'Oscorpsvr', 'oscorp_supply');
mysqli_query($link, "INSERT INTO sessions (user_id, created, expires) VALUES ('".$jsonSes->user_id."','".$jsonSes->created."','".$jsonSes->expires."')");
$id = mysqli_insert_id($link);
echo json_encode([
    "session_id" => $id,
]);
