
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



$jsonOrd = json_decode(file_get_contents("php://input"));

try {
  $link = mysqli_connect('localhost', 'root', 'Oscorpsvr', 'oscorp_supply');
  $razSoc = mysqli_real_escape_string($link, $jsonOrd->razon_social);
  mysqli_query($link, "INSERT INTO ordenes (req_id, numero, ruc, razon_social, direccion, subtotal, igv, total, rebajado, fecha, destino, tipo, estado, empresa, moneda, area, destino_dir, tipo_pago, num_cuenta, retencion, retencion_percent, percepcion) 
  VALUES (".$jsonOrd->req_id.",'".$jsonOrd->numero."','".$jsonOrd->ruc."','".$razSoc."','".$jsonOrd->direccion."','".$jsonOrd->subtotal."','".$jsonOrd->igv."','".$jsonOrd->total."','".$jsonOrd->rebajado."','".$jsonOrd->fecha."','".$jsonOrd->destino."','".$jsonOrd->tipo."','".$jsonOrd->estado."','".$jsonOrd->empresa."','".$jsonOrd->moneda."','".$jsonOrd->area."','".$jsonOrd->destino_dir."','".$jsonOrd->tipo_pago."','".$jsonOrd->num_cuenta."','".$jsonOrd->retencion."','".$jsonOrd->retencion_percent."','".$jsonOrd->percepcion."')");
  $id = mysqli_insert_id($link);
  echo json_encode([
      "session_id" => $id,
  ]);
} catch (Exception $e) {
  echo $e->getMessage();
}
