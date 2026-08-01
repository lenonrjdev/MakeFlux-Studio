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

#[derive(Clone)]
pub struct EstadoAgendadorRotinas {
    pub iniciado: Arc<AtomicBool>,
    pub parar: Arc<AtomicBool>,
    pub ultimo_ciclo_em: Arc<Mutex<u64>>,
}

impl Default for EstadoAgendadorRotinas {
    fn default() -> Self {
        Self {
            iniciado: Arc::new(AtomicBool::new(false)),
            parar: Arc::new(AtomicBool::new(false)),
            ultimo_ciclo_em: Arc::new(Mutex::new(0)),
        }
    }
}

#[derive(Clone, Debug)]
pub struct SessaoOauthPendente {
    pub provedor: String,
    pub state: String,
    pub verifier: String,
    pub redirect_uri: String,
    pub codigo: Option<String>,
    pub erro: Option<String>,
    pub expira_em: u64,
}

#[derive(Clone, Default)]
pub struct EstadoOauthPublicacao(pub Arc<Mutex<HashMap<String, SessaoOauthPendente>>>);

#[derive(Clone, Default)]
pub struct EstadoRequisicoesIa(pub Arc<Mutex<HashMap<String, Arc<AtomicBool>>>>);
