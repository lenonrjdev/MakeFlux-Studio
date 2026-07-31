use std::{process::Child, sync::Mutex};

pub struct ProcessoMotor {
    pub child: Child,
    pub diretorio: String,
    pub iniciado_em: String,
    pub log: String,
}

#[derive(Default)]
pub struct EstadoProcessoMotor(pub Mutex<Option<ProcessoMotor>>);
