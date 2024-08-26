<?php
header("Access-Control-Allow-Origin: *");

$bd = include_once "bdLogistica.php";

// Obtener los parámetros de los filtros
$sede = $_GET['sede'];
$categoria = $_GET['categoria'];
$estado = $_GET['estado'];
$start_date = $_GET['start_date']; // Fecha de inicio
$end_date = $_GET['end_date'];     // Fecha de fin

// Variables para los filtros dinámicos
$sedeFilter = "";
$categoriaFilter = "";
$estadoFilter = "";
$dateFilter = "";

// Filtrar por sede (campus) si no es "TODOS"
if ($sede != "TODOS") {
    $sedeFilter = " AND campus = '".$sede."'";
}

// Filtrar por categoría si no es "TODOS"
if ($categoria != "TODOS") {
    $categoriaFilter = " AND categoria = '".$categoria."'";
}

// Filtrar por estado si no es "TODOS"
if ($estado != "TODOS") {
    $estadoFilter = " AND estado = '".$estado."'";
}

// Filtrar por rango de fechas si se proporcionan ambas fechas
if (!empty($start_date) && !empty($end_date)) {
    $dateFilter = " AND fecha BETWEEN '".$start_date."' AND '".$end_date."'";
}

// Construir la consulta SQL completa
$sentencia = $bd->prepare("
    SELECT id, campus, fecha, tipo_doc, serie, numero, ruc, raz_social, monto, estado, liquidacion_id, categoria, user_id, orden_id
    FROM entregaitems
    WHERE 1 = 1
    ".$sedeFilter.$categoriaFilter.$estadoFilter.$dateFilter."
    ORDER BY fecha DESC
");

// Ejecutar la consulta
$sentencia->execute();

// Obtener los resultados
$entregaitems = $sentencia->fetchAll(PDO::FETCH_OBJ);

// Devolver los resultados en formato JSON
echo json_encode($entregaitems);
?>
