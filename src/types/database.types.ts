export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    password_hash: string
                    nome_condutor: string
                    permissoes: 'ADMIN' | 'USER'
                    tipo: 1 | 2 // 1 = ADMIN, 2 = USER
                    ativo: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    password_hash: string
                    nome_condutor: string
                    permissoes?: 'ADMIN' | 'USER'
                    tipo?: 1 | 2
                    ativo?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    password_hash?: string
                    nome_condutor?: string
                    permissoes?: 'ADMIN' | 'USER'
                    tipo?: 1 | 2
                    ativo?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            vehicles: {
                Row: {
                    id: string
                    placa: string
                    renavam: string
                    veiculo: string
                    empresa: string
                    status: 'Disponível' | 'Em Uso' | 'Reservado'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    placa: string
                    renavam: string
                    veiculo: string
                    empresa: string
                    status?: 'Disponível' | 'Em Uso' | 'Reservado'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    placa?: string
                    renavam?: string
                    veiculo?: string
                    empresa?: string
                    status?: 'Disponível' | 'Em Uso' | 'Reservado'
                    created_at?: string
                    updated_at?: string
                }
            }
            vehicle_usage: {
                Row: {
                    id: string
                    vehicle_id: string
                    user_id: string
                    condutor: string
                    veiculo: string
                    status: 'Reservado' | 'Em Uso' | 'Finalizado'
                    data_reserva: string | null
                    data_saida: string | null
                    hora_saida: string | null
                    data_retorno: string | null
                    hora_retorno: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    vehicle_id: string
                    user_id: string
                    condutor: string
                    veiculo: string
                    status?: 'Reservado' | 'Em Uso' | 'Finalizado'
                    data_reserva?: string | null
                    data_saida?: string | null
                    hora_saida?: string | null
                    data_retorno?: string | null
                    hora_retorno?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    vehicle_id?: string
                    user_id?: string
                    condutor?: string
                    veiculo?: string
                    status?: 'Reservado' | 'Em Uso' | 'Finalizado'
                    data_reserva?: string | null
                    data_saida?: string | null
                    hora_saida?: string | null
                    data_retorno?: string | null
                    hora_retorno?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            infractions: {
                Row: {
                    id: string
                    vehicle_id: string
                    auto_infracao: string
                    renainf: string | null
                    multa_original: number | null
                    status: string | null
                    tipo_infracao: string | null
                    veiculo: string
                    data_infracao: string
                    local: string | null
                    horario: string | null
                    infracao: string | null
                    infrator: string | null
                    valor_original: number | null
                    valor_liquido: number | null
                    prazo_recurso: string | null
                    prazo_identificacao: string | null
                    vencimento: string | null
                    boleto_impresso: boolean | null
                    condutor_identificado: string | null
                    condutor_infrator_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    vehicle_id: string
                    auto_infracao: string
                    renainf?: string | null
                    multa_original?: number | null
                    status?: string | null
                    tipo_infracao?: string | null
                    veiculo: string
                    data_infracao: string
                    local?: string | null
                    horario?: string | null
                    infracao?: string | null
                    infrator?: string | null
                    valor_original?: number | null
                    valor_liquido?: number | null
                    prazo_recurso?: string | null
                    prazo_identificacao?: string | null
                    vencimento?: string | null
                    boleto_impresso?: boolean | null
                    condutor_identificado?: string | null
                    condutor_infrator_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    vehicle_id?: string
                    auto_infracao?: string
                    renainf?: string | null
                    multa_original?: number | null
                    status?: string | null
                    tipo_infracao?: string | null
                    veiculo?: string
                    data_infracao?: string
                    local?: string | null
                    horario?: string | null
                    infracao?: string | null
                    infrator?: string | null
                    valor_original?: number | null
                    valor_liquido?: number | null
                    prazo_recurso?: string | null
                    prazo_identificacao?: string | null
                    vencimento?: string | null
                    boleto_impresso?: boolean | null
                    condutor_identificado?: string | null
                    condutor_infrator_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            vehicles_with_infraction_count: {
                Row: {
                    id: string
                    placa: string
                    renavam: string
                    veiculo: string
                    empresa: string
                    status: 'Disponível' | 'Em Uso' | 'Reservado'
                    total_infracoes: number
                }
            }
            users_with_infraction_count: {
                Row: {
                    id: string
                    email: string
                    nome_condutor: string
                    permissoes: 'ADMIN' | 'USER'
                    total_infracoes: number
                }
            }
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
