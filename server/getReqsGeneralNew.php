<?php
header("Access-Control-Allow-Origin: *");

$bd = include_once "bdLogistica.php";

$user_role = $_GET['user_role'];
$user_id = $_GET['user_id'];
$status = $_GET['status'];
$salas = $_GET['salas'];
$extraString = "";
$validationExtraString = "";

if ($user_role == 'SUPER USUARIO') {
    // Lógica específica para SUPER USUARIO
}

if ($user_role == 'SUPER ADMINISTRADOR') {
    // Lógica específica para SUPER ADMINISTRADOR
}

if ($user_role == 'ADMINISTRADOR') {
    // Lógica específica para ADMINISTRADOR
}

if ($user_role == 'ASISTENTE') {
    // Lógica específica para ASISTENTE
}

if ($user_role == 'USUARIO AVANZADO') {
    // Lógica específica para USUARIO AVANZADO
}

if ($user_role == 'USUARIO') {
    $extraString .= "AND a.user_id = " . $user_id;
}

if ($user_role == 'SUPERVISOR') {
    $extraString = "";
    if (!empty($salas)) {
        $salasArray = explode(',', $salas);
        $extraString .= "AND (";
        foreach ($salasArray as $sala) {
            $extraString .= "sala = '" . $sala . "' OR ";
        }
        $extraString = rtrim($extraString, " OR ");
        $extraString .= ")";
    }
    $validationExtraString=" AND b.user_id=".$user_id." ";
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
    rd.id as rd_id,
    COALESCE(b.state,
    CASE
        WHEN COUNT(b.id) = 0 THEN 'NO CORRESPONDE'
        WHEN COUNT(b.id) = 1 THEN MAX(b.state)
        WHEN COUNT(b.id) > 1 AND SUM(b.state = 'PENDIENTE') > 0 THEN 'PENDIENTE'
        WHEN COUNT(b.id) > 1 AND SUM(b.state = 'PENDIENTE') = 0 AND COUNT(DISTINCT b.state) = 1 THEN MAX(b.state)
        ELSE 'CONFLICTO'
    END) AS validation,
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
    " . $extraString . "
GROUP BY rd.id
ORDER BY 
    a.id DESC) t
WHERE t.estado='".$status."'
GROUP BY t.id, t.estado
");

$sentencia->execute();
$reqs = $sentencia->fetchAll(PDO::FETCH_OBJ);
echo json_encode($reqs);
?>
