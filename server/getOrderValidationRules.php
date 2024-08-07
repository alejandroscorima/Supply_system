<?php
header("Access-Control-Allow-Origin: *"); // Permite el acceso desde cualquier origen

// Incluir el archivo de conexión a la base de datos
$bd = include_once "bdLogistica.php";

$campus_id = $_GET['campus_id'];
$monto = floatval($_GET['monto']); // Convertir monto a float

// Preparar la consulta SQL para seleccionar datos de la tabla order_validation_rules
$sentencia = $bd->prepare("SELECT id, campus_id, user_id, CAST(amount AS FLOAT) AS amount FROM oscorp_supply.order_validation_rules
WHERE campus_id = :campus_id AND CAST(amount AS FLOAT) <= :monto");

// Ejecutar la consulta
$sentencia->execute(['campus_id' => $campus_id, 'monto' => $monto]);

// Obtener los resultados como un arreglo de objetos JSON
$resultados = $sentencia->fetchAll(PDO::FETCH_ASSOC);

// Si no hay resultados, devolver "NO HAY DATOS"

    // Devolver los resultados como respuesta en formato JSON
    echo json_encode($resultados);

?>
