<?php
header("Access-Control-Allow-Origin: *");

$bd = include_once "bdLogistica.php";

// Obtener los parámetros de los filtros
$sede = $_GET['sede'];
$area = $_GET['area'];
$start_date = $_GET['start_date']; // Fecha de inicio
$end_date = $_GET['end_date'];     // Fecha de fin

// Variables para los filtros dinámicos
$sedeFilter = "";
$areaFilter = "";
$dateFilter = "";

// Filtrar por sede si no es "TODOS"
if ($sede != "TODOS") {
    $sedeFilter = " AND destino = '".$sede."'";
}

// Filtrar por área si no es "TODOS"
if ($area != "TODOS") {
    $areaFilter = " AND area = '".$area."'";
}

// Filtrar por rango de fechas si se proporcionan ambas fechas
if (!empty($start_date) && !empty($end_date)) {
    $dateFilter = " AND fecha BETWEEN '".$start_date."' AND '".$end_date."'";
}

// Construir la consulta SQL completa
$sentencia = $bd->prepare("
    SELECT id, req_id, numero, ruc, razon_social, direccion, subtotal, igv, total, rebajado, fecha, destino, tipo, estado, empresa, moneda, area, destino_dir, tipo_pago, num_cuenta, retencion, retencion_percent, percepcion, fecha_gen, hora_gen, receipt, txt, section, observacion, status, step_id, step, step_status, folder_id
    FROM ordenes
    WHERE section = 'OFICINA'
    ".$sedeFilter.$areaFilter.$dateFilter."
    ORDER BY fecha DESC
");

// Ejecutar la consulta
$sentencia->execute();

// Obtener los resultados
$orders = $sentencia->fetchAll(PDO::FETCH_OBJ);

// Devolver los resultados en formato JSON
echo json_encode($orders);
?>
