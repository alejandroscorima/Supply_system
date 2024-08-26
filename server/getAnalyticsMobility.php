<?php
header("Access-Control-Allow-Origin: *");

$bd = include_once "bdLogistica.php";

// Obtener los parámetros de los filtros
$sede = $_GET['sede'];
$estado = $_GET['estado'];
$start_date = $_GET['start_date']; // Fecha de inicio
$end_date = $_GET['end_date'];     // Fecha de fin

// Variables para los filtros dinámicos
$sedeFilter = "";
$estadoFilter = "";
$dateFilter = "";

// Filtrar por sede si no es "TODOS"
if ($sede != "TODOS") {
    $sedeFilter = " AND campus = '".$sede."'";
}

// Filtrar por estado si no es "TODOS"
if ($estado != "TODOS") {
    $estadoFilter = " AND estado = '".$estado."'";
}

// Filtrar por rango de fechas si se proporcionan ambas fechas
if (!empty($start_date) && !empty($end_date)) {
    $dateFilter = " AND fecha_gen BETWEEN '".$start_date."' AND '".$end_date."'";
}

// Construir la consulta SQL completa
$sentencia = $bd->prepare("
    SELECT id, fecha, campus, monto, estado, user_id, hora_gen, fecha_gen, numero
    FROM mobility
    WHERE TRUE
    ".$sedeFilter.$estadoFilter.$dateFilter."
    ORDER BY fecha DESC
");

// Ejecutar la consulta
$sentencia->execute();

// Obtener los resultados
$mobilityRecords = $sentencia->fetchAll(PDO::FETCH_OBJ);

// Devolver los resultados en formato JSON
echo json_encode($mobilityRecords);
?>
