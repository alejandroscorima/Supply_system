<?php
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    exit("Solo acepto peticiones POST");
}

$jsonUser = json_decode(file_get_contents("php://input"));
if (!$jsonUser) {
    exit("No hay datos");
}

$bd = include_once "bdData.php";

try {
    $sentencia = $bd->prepare("INSERT INTO user2 (colab_id, type_doc, doc_number, first_name, paternal_surname, maternal_surname, gender, birth_date, civil_status, profession, cel_number, email, address, district, province, region, username, password, supply_role, latitud, longitud, photo_url) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");

    $resultado = $sentencia->execute([$jsonUser->colab_id, $jsonUser->type_doc, $jsonUser->doc_number, $jsonUser->first_name, $jsonUser->paternal_surname, $jsonUser->maternal_surname, $jsonUser->gender, $jsonUser->birth_date, $jsonUser->civil_status, $jsonUser->profession, $jsonUser->cel_number, $jsonUser->email, $jsonUser->address, $jsonUser->district, $jsonUser->province, $jsonUser->region, $jsonUser->username, $jsonUser->password, $jsonUser->supply_role, $jsonUser->latitud, $jsonUser->longitud, $jsonUser->photo_url]);

    if ($resultado) {
        // Obtener el ID del usuario insertado
        $lastInsertedId = $bd->lastInsertId();

        echo json_encode([
            "resultado" => $resultado,
            "lastInsertedId" => $lastInsertedId,
        ]);
    } else {
        echo json_encode([
            "resultado" => $resultado,
        ]);
    }
} catch (PDOException $e) {
    // Captura y muestra el mensaje de error en caso de excepción
    echo json_encode([
        "error" => "Error en la ejecución de la consulta: " . $e->getMessage(),
    ]);
}
?>
