<?php
header("Access-Control-Allow-Origin: *"); // Permite el acceso desde cualquier origen

// Incluir el archivo de conexión a la base de datos
$bd = include_once "bdLogistica.php";

$campus_id=$_GET['campus_id'];


// Preparar la consulta SQL para seleccionar datos de la tabla orders_validations
$sentencia = $bd->prepare("SELECT id, campus_id, user_id, amount FROM order_validation_rules
WHERE campus_id=".$campus_id." ");

// Ejecutar la consulta
$sentencia->execute();

// Obtener los resultados como un arreglo de objetos JSON
$resultados = $sentencia->fetchAll(PDO::FETCH_ASSOC);

// Devolver los resultados como respuesta en formato JSON
echo json_encode($resultados);
?>
