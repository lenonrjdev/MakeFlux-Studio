mod commands;
mod models;
mod state;

use state::{EstadoCofre, EstadoProcessoMotor};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(EstadoProcessoMotor::default())
        .manage(EstadoCofre::default())
        .invoke_handler(tauri::generate_handler![
            commands::capacidades::detectar_capacidades_sistema,
            commands::http::testar_http_nativo,
            commands::moneyprinter::verificar_moneyprinter,
            commands::moneyprinter::criar_video_moneyprinter,
            commands::moneyprinter::consultar_tarefa_moneyprinter,
            commands::moneyprinter::excluir_tarefa_moneyprinter,
            commands::processo::iniciar_motor_moneyprinter,
            commands::processo::status_motor_moneyprinter,
            commands::processo::parar_motor_moneyprinter,
            commands::atualizacao::inspecionar_repositorio_motor,
            commands::atualizacao::verificar_atualizacao_motor,
            commands::atualizacao::atualizar_motor_seguro,
            commands::atualizacao::rollback_motor_seguro,
            commands::dados::status_banco_local,
            commands::dados::migrar_workspace_sqlite,
            commands::dados::listar_registros_sqlite,
            commands::dados::registrar_telemetria_local,
            commands::dados::listar_telemetria_local,
            commands::dados::limpar_telemetria_local,
            commands::cofre::status_cofre,
            commands::cofre::inicializar_cofre,
            commands::cofre::desbloquear_cofre,
            commands::cofre::bloquear_cofre,
            commands::cofre::listar_segredos_cofre,
            commands::cofre::salvar_segredo_cofre,
            commands::cofre::remover_segredo_cofre,
        ])
        .on_window_event(|janela, evento| {
            if let tauri::WindowEvent::Destroyed = evento {
                use tauri::Manager;
                let estado = janela.state::<EstadoProcessoMotor>();
                if let Ok(mut bloqueio) = estado.0.lock() {
                    if let Some(mut processo) = bloqueio.take() {
                        let _ = processo.child.kill();
                        let _ = processo.child.wait();
                    }
                };
                let cofre = janela.state::<EstadoCofre>();
                if let Ok(mut bloqueio) = cofre.0.lock() {
                    if let Some(mut chave) = bloqueio.take() {
                        use zeroize::Zeroize;
                        chave.zeroize();
                    }
                };
            }
        })
        .run(tauri::generate_context!())
        .expect("erro ao iniciar o MakeFlux Studio");
}
