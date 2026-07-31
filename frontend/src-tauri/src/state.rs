use std::{
    collections::HashMap,
    process::Child,
    sync::{atomic::AtomicBool, Arc, Mutex},
};

pub struct ProcessoMotor {
    pub child: Child,
    pub diretorio: String,
    pub iniciado_em: String,
    pub log: String,
}

#[derive(Default)]
pub struct EstadoProcessoMotor(pub Mutex<Option<ProcessoMotor>>);

#[derive(Default)]
pub struct EstadoCofre(pub Mutex<Option<[u8; 32]>>);

#[derive(Clone, Default)]
pub struct EstadoOperacoesLote(pub Arc<Mutex<HashMap<String, Arc<AtomicBool>>>>);
