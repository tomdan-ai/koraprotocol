use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::{Addr, Uint128};

#[cw_serde]
pub struct InstantiateMsg {}

#[cw_serde]
pub enum ExecuteMsg {
    /// Set or update the caller's DCA strategy.
    SetStrategy {
        amount_per_order: Uint128,
        interval_seconds: u64,
        market_id: String,
    },
    /// Pause the caller's strategy without deleting it.
    PauseStrategy {},
    /// Resume a paused strategy.
    ResumeStrategy {},
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    #[returns(StrategyResponse)]
    GetStrategy { address: String },
    #[returns(Vec<StrategyResponse>)]
    GetAllStrategies {},
}

#[cw_serde]
pub struct StrategyResponse {
    pub address: String,
    pub strategy: Option<Strategy>,
}

#[cw_serde]
pub struct Strategy {
    pub owner: Addr,
    pub amount_per_order: Uint128,
    pub interval_seconds: u64,
    pub market_id: String,
    pub last_executed: u64,
    pub is_active: bool,
}
