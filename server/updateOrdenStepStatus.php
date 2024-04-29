<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: *");

try {
    // Verifica si la petición es de tipo PUT
    if ($_SERVER["REQUEST_METHOD"] != "PUT") {
        throw new Exception("Solo acepto peticiones PUT");
    }

    // Lee y decodifica los datos JSON del cuerpo de la solicitud
    $jsonOrd = json_decode(file_get_contents("php://input"));

    // Verifica si se han recibido datos
    if (!$jsonOrd) {
        throw new Exception("No hay datos");
    }

    // Incluye el archivo de conexión a la base de datos
    $bd = include_once "bdLogistica.php";

    // Prepara la consulta SQL para actualizar los datos
    $sentencia = $bd->prepare("UPDATE ordenes SET step_id = ?, step = ?, step_status = ?, folder_id = ? WHERE id = ?");

    // Ejecuta la consulta SQL con los valores proporcionados
    $resultado = $sentencia->execute([

        $jsonOrd->step_id,
        $jsonOrd->step,
        $jsonOrd->step_status,
        $jsonOrd->folder_id,
        $jsonOrd->id
    ]);

    // Devuelve el resultado de la operación en formato JSON
    echo json_encode($resultado);
} catch (Exception $e) {
    // Captura cualquier excepción que se produzca durante la ejecución del código
    // Imprime un mensaje de error detallado en formato JSON
    echo json_encode(array("error" => $e->getMessage()));
}
?>
