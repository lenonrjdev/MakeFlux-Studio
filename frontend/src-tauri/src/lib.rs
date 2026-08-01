mod commands;
mod models;
mod state;

use state::{
    EstadoAgendadorRotinas, EstadoCofre, EstadoEnviosPublicacao, EstadoOauthPublicacao,
    EstadoOperacoesLote, EstadoProcessoMotor, EstadoRequisicoesIa,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .manage(EstadoProcessoMotor::default())
        .manage(EstadoCofre::default())
        .manage(EstadoOperacoesLote::default())
        .manage(EstadoAgendadorRotinas::default())
        .manage(EstadoOauthPublicacao::default())
        .manage(EstadoRequisicoesIa::default())
        .manage(EstadoEnviosPublicacao::default())
        .invoke_handler(tauri::generate_handler![
            commands::capacidades::detectar_capacidades_sistema,
            commands::http::testar_http_nativo,
            commands::instalacao::diagnosticar_instalacao_assistida,
            commands::instalacao::preparar_workspace_assistido,
            commands::instalacao::instalar_dependencia_assistida,
            commands::instalacao::instalar_moneyprinter_assistido,
            commands::instalacao::validar_moneyprinter_assistido,
            commands::instalacao::abrir_pasta_instalacao_assistida,
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
            commands::desempenho::consultar_status_desempenho,
            commands::desempenho::listar_registros_paginados,
            commands::desempenho::iniciar_operacao_lote,
            commands::desempenho::cancelar_operacao_lote,
            commands::desempenho::listar_operacoes_lote,
            commands::desempenho::executar_manutencao_banco,
            commands::exportacoes::preparar_pasta_exportacao,
            commands::exportacoes::consolidar_arquivos_exportacao,
            commands::exportacoes::abrir_arquivo_exportado,
            commands::exportacoes::revelar_arquivo_exportado,
            commands::exportacoes::abrir_pasta_exportacao,
            commands::rotinas::listar_rotinas_agendadas,
            commands::rotinas::salvar_rotina_agendada,
            commands::rotinas::alterar_status_rotina,
            commands::rotinas::remover_rotina_agendada,
            commands::rotinas::executar_rotina_agora,
            commands::rotinas::processar_rotinas_pendentes,
            commands::rotinas::listar_execucoes_rotinas,
            commands::rotinas::listar_notificacoes_locais,
            commands::rotinas::marcar_notificacao_lida,
            commands::rotinas::marcar_todas_notificacoes_lidas,
            commands::rotinas::remover_notificacoes_lidas,
            commands::rotinas::enviar_notificacao_teste,
            commands::rotinas::status_agendador_rotinas,
            commands::oauth::iniciar_oauth_publicacao,
            commands::oauth::concluir_oauth_publicacao,
            commands::oauth::listar_conexoes_publicacao,
            commands::oauth::desconectar_canal_publicacao,
            commands::oauth::renovar_token_canal_publicacao,
            commands::publicacao_social::publicar_conteudo_social,
            commands::publicacao_social::listar_envios_publicacao,
            commands::publicacao_social::cancelar_envio_publicacao,
            commands::publicacao_social::repetir_envio_publicacao,
            commands::armazenamento_publicacao::consultar_configuracao_armazenamento_publicacao,
            commands::armazenamento_publicacao::salvar_configuracao_armazenamento_publicacao,
            commands::armazenamento_publicacao::testar_armazenamento_publicacao,
            commands::armazenamento_publicacao::enviar_ativo_temporario_publicacao,
            commands::armazenamento_publicacao::listar_ativos_temporarios_publicacao,
            commands::armazenamento_publicacao::remover_ativo_temporario_publicacao,
            commands::armazenamento_publicacao::limpar_ativos_temporarios_expirados,
            commands::atualizador::status_atualizador_nativo,
            commands::observabilidade::registrar_log_estruturado,
            commands::observabilidade::listar_logs_estruturados,
            commands::observabilidade::consultar_resumo_observabilidade,
            commands::observabilidade::limpar_logs_estruturados,
            commands::observabilidade::exportar_pacote_diagnostico,
            commands::observabilidade::revelar_pacote_diagnostico,
            commands::provedores_ia::listar_provedores_ia,
            commands::provedores_ia::salvar_configuracao_provedor_ia,
            commands::provedores_ia::salvar_credencial_provedor_ia,
            commands::provedores_ia::remover_credencial_provedor_ia,
            commands::provedores_ia::testar_provedor_ia,
            commands::provedores_ia::executar_experimento_ia,
            commands::provedores_ia::cancelar_execucao_ia,
            commands::provedores_ia::listar_execucoes_ia,
            commands::provedores_ia::consultar_resumo_uso_ia,
            commands::beta::consultar_beta_operacional,
            commands::beta::iniciar_sessao_beta,
            commands::beta::atualizar_check_beta,
            commands::beta::finalizar_sessao_beta,
            commands::beta::exportar_relatorio_beta,
            commands::beta::criar_snapshot_beta,
            commands::beta::revelar_artefato_beta,
        ])
        .setup(|app| {
            use tauri::Manager;

            // O build comum não possui configuração do updater. Registrar o plugin
            // somente nas distribuições assinadas evita que `plugins.updater: null`
            // encerre o aplicativo durante a inicialização.
            if option_env!("MAKEFLUX_ATUALIZADOR_CONFIGURADO") == Some("1") {
                app.handle()
                    .plugin(tauri_plugin_updater::Builder::new().build())?;
            }

            let estado = app.state::<EstadoAgendadorRotinas>().inner().clone();
            commands::rotinas::iniciar_worker_rotinas(app.handle().clone(), estado);
            let _ = commands::observabilidade::limpar_logs_estruturados(app.handle().clone(), 30);
            let _ = commands::publicacao_social::recuperar_envios_interrompidos(app.handle());
            let _ = commands::observabilidade::registrar_log_interno(
                app.handle(),
                "info",
                "rust",
                "aplicativo.inicializado",
                "Runtime nativo iniciado.",
                "startup",
                serde_json::json!({ "versao": env!("CARGO_PKG_VERSION") }),
            );
            Ok(())
        })
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
                let agendador = janela.state::<EstadoAgendadorRotinas>();
                agendador
                    .parar
                    .store(true, std::sync::atomic::Ordering::SeqCst);
            }
        })
        .run(tauri::generate_context!())
        .expect("erro ao iniciar o MakeFlux Studio");
}
