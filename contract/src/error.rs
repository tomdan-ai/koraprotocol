use cosmwasm_std::{StdError, StdResult};
use thiserror::Error;

#[derive(Error, Debug, PartialEq)]
pub enum ContractError {
    #[error("Unauthorized")]
    Unauthorized {},

    #[error("Strategy not found")]
    StrategyNotFound {},

    #[error("{0}")]
    Std(#[from] StdError),
}

pub type Result<T> = StdResult<T, ContractError>;
