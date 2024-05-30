<?php
header("Access-Control-Allow-Origin: *"); // Permite el acceso desde cualquier origen

// Incluir el archivo de conexión a la base de datos
$bd = include_once "bdLogistica.php";

$campus_id = $_GET['campus_id'];
$total_budget = floatval($_GET['total_budget']); // Convertir monto a float

// Preparar la consulta SQL para seleccionar datos de la tabla order_validation_rules
$sentencia = $bd->prepare("SELECT id, campus_id, user_id, CAST(amount AS FLOAT) AS amount FROM oscorp_supply.req_validation_rules
WHERE campus_id = :campus_id AND CAST(amount AS FLOAT) <= :total_budget");

// Ejecutar la consulta
$sentencia->execute(['campus_id' => $campus_id, 'total_budget' => $total_budget]);

// Obtener los resultados como un arreglo de objetos JSON
$resultados = $sentencia->fetchAll(PDO::FETCH_ASSOC);

// Si no hay resultados, devolver "NO HAY DATOS"

    // Devolver los resultados como respuesta en formato JSON
    echo json_encode($resultados);

?>
