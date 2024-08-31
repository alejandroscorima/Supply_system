<?php
header("Access-Control-Allow-Origin: *");

$bd = include_once "bdLogistica.php";



$status = $_GET['status'];
$sede = $_GET['sede'];

$start_date = $_GET['start_date']; // Fecha de inicio
$end_date = $_GET['end_date']; // Fecha de fin
$area = $_GET['area']; // Área

$extraString = "";
$validationExtraString = "";

$dateFilter = " AND a.fecha BETWEEN '" . $start_date . "' AND '" . $end_date . "'";

$statusFilter ="";
if($status!="TODOS"){
    $statusFilter=" AND t.estado ='".$status."'";
}

$areaFilter ="";
if($area!="TODOS"){
    $areaFilter=" AND a.area ='".$area."'";
}

$sedeFilter ="";
if($sede!="TODOS"){
    $sedeFilter=" AND a.sala ='".$sede."'";
}



$sentencia = $bd->prepare("
SELECT * FROM
(SELECT 
    a.id, 
    a.codigo, 
    a.fecha, 
    a.area, 
    a.encargado, 
    a.sala, 
    a.prioridad, 
    a.motivo, 
    a.id_asignado, 
    a.total_budget,
    rd.id as rd_id,
    COALESCE(b.id,0) AS validation_id,
    CASE
        WHEN COUNT(b.id) = 0 THEN 'NO CORRESPONDE'
        WHEN COUNT(b.id) = 1 THEN MAX(b.state)
        WHEN COUNT(b.id) > 1 AND SUM(b.state = 'PENDIENTE') > 0 THEN 'PENDIENTE'
        WHEN COUNT(b.id) > 1 AND SUM(b.state = 'PENDIENTE') = 0 AND COUNT(DISTINCT b.state) = 1 THEN MAX(b.state)
        ELSE 'CONFLICTO'
    END AS validation,
    CASE
        WHEN SUM(CASE WHEN rd.estado = 'ENTREGADO' THEN 1 ELSE 0 END) > 0 THEN 'FINALIZADO'
        WHEN SUM(CASE WHEN rd.estado IN ('ASIGNADO', 'COMPRADO') THEN 1 ELSE 0 END) > 0 THEN 'PROCESO'
        WHEN SUM(CASE WHEN rd.estado = 'PENDIENTE' THEN 1 ELSE 0 END) > 0 THEN 'PENDIENTE'
        ELSE 'NO DEFINIDO'
    END AS estado
FROM 
    requerimientos a
LEFT JOIN 
    req_validations b ON a.id = b.req_id".$validationExtraString."
LEFT JOIN 
    req_detalles rd ON a.codigo = rd.req_codigo
WHERE 
    TRUE

    ".$extraString.$areaFilter.$sedeFilter.$dateFilter."


GROUP BY rd.id
ORDER BY 
    a.id DESC) t WHERE TRUE ".$statusFilter."
GROUP BY t.id, t.estado
");

$sentencia->execute();
$reqs = $sentencia->fetchAll(PDO::FETCH_OBJ);
echo json_encode($reqs);
?>
