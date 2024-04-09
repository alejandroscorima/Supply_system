<?php
header("Access-Control-Allow-Origin: *"); // Permite el acceso desde cualquier origen

// Incluir el archivo de conexión a la base de datos
$bd = include_once "bdLogistica.php";

// Obtener el valor del parámetro campus_id desde la URL (usando $_GET)
$order_id = $_GET['order_id'];

// Preparar la consulta SQL para seleccionar datos de la tabla orders_validations filtrando por campus_id
$sentencia = $bd->prepare("SELECT id, user_id, order_id, date, hour, state  FROM orders_validations WHERE order_id = ".$order_id." ");

// Ejecutar la consulta
$sentencia->execute();

// Obtener los resultados como un arreglo asociativo
$resultados = $sentencia->fetchAll(PDO::FETCH_ASSOC);

// Devolver los resultados como respuesta en formato JSON
echo json_encode($resultados);
?>
