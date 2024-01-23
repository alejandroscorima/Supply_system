
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



$jsonEntregaLiquidacion = json_decode(file_get_contents("php://input"));





try {
    $link = mysqli_connect('localhost', 'root', 'Oscorpsvr', 'oscorp_supply');
    mysqli_query($link, "INSERT INTO entregaliquidaciones (fecha,campus,campus_dir,numero,importe,personal, empresa, user_id, estado) 
    VALUES ('".$jsonEntregaLiquidacion->fecha."','".$jsonEntregaLiquidacion->campus."','".$jsonEntregaLiquidacion->campus_dir."','".$jsonEntregaLiquidacion->numero."','".$jsonEntregaLiquidacion->importe."','".$jsonEntregaLiquidacion->personal."','".$jsonEntregaLiquidacion->empresa."','".$jsonEntregaLiquidacion->user_id."','".$jsonEntregaLiquidacion->estado."')");
    $id = mysqli_insert_id($link);
    echo json_encode([
        "liq_id" => $id,
    ]);
} catch (Exception $e) {
    echo $e->getMessage();
}

