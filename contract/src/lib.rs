use cosmwasm_std::{entry_point, to_json_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult};

mod msg;
mod state;

use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg, StrategyResponse};
use crate::state::STRATEGIES;

#[entry_point]
pub fn instantiate(
    _deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    _msg: InstantiateMsg,
) -> StdResult<Response> {
    // nothing to initialize beyond versioning
    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("owner", info.sender))
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> StdResult<Response> {
    match msg {
        ExecuteMsg::SetStrategy {
            amount_per_order,
            interval_seconds,
            market_id,
        } => crate::contract::execute_set_strategy(deps, info, amount_per_order, interval_seconds, market_id),
        ExecuteMsg::PauseStrategy {} => crate::contract::execute_pause_strategy(deps, info),
        ExecuteMsg::ResumeStrategy {} => crate::contract::execute_resume_strategy(deps, info),
    }
}

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetStrategy { address } => to_json_binary(&query_strategy(deps, address)?),
        QueryMsg::GetAllStrategies {} => to_json_binary(&query_all_strategies(deps)?),
    }
}

pub mod contract {
    use cosmwasm_std::{StdError, StdResult, Uint128};

    use crate::msg::Strategy;
    use crate::state::STRATEGIES;

    pub fn execute_set_strategy(
        deps: cosmwasm_std::DepsMut,
        info: cosmwasm_std::MessageInfo,
        amount_per_order: Uint128,
        interval_seconds: u64,
        market_id: String,
    ) -> StdResult<cosmwasm_std::Response> {
        let sender = deps.api.addr_validate(info.sender.as_str())?;

        let strategy = Strategy {
            owner: sender.clone(),
            amount_per_order,
            interval_seconds,
            market_id,
            last_executed: 0,
            is_active: true,
        };

        STRATEGIES.save(deps.storage, &sender, &strategy)?;

        Ok(cosmwasm_std::Response::new()
            .add_attribute("action", "set_strategy")
            .add_attribute("owner", sender))
    }

    pub fn execute_pause_strategy(
        deps: cosmwasm_std::DepsMut,
        info: cosmwasm_std::MessageInfo,
    ) -> StdResult<cosmwasm_std::Response> {
        let sender = deps.api.addr_validate(info.sender.as_str())?;
        STRATEGIES.update(deps.storage, &sender, |maybe| -> StdResult<_> {
            let mut strategy = maybe.ok_or(StdError::generic_err("strategy not found"))?;
            strategy.is_active = false;
            Ok(strategy)
        })?;

        Ok(cosmwasm_std::Response::new()
            .add_attribute("action", "pause_strategy")
            .add_attribute("owner", sender))
    }

    pub fn execute_resume_strategy(
        deps: cosmwasm_std::DepsMut,
        info: cosmwasm_std::MessageInfo,
    ) -> StdResult<cosmwasm_std::Response> {
        let sender = deps.api.addr_validate(info.sender.as_str())?;
        STRATEGIES.update(deps.storage, &sender, |maybe| -> StdResult<_> {
            let mut strategy = maybe.ok_or(StdError::generic_err("strategy not found"))?;
            strategy.is_active = true;
            Ok(strategy)
        })?;

        Ok(cosmwasm_std::Response::new()
            .add_attribute("action", "resume_strategy")
            .add_attribute("owner", sender))
    }
}

pub fn query_strategy(deps: Deps, address: String) -> StdResult<StrategyResponse> {
    let addr = deps.api.addr_validate(&address)?;
    let strategy = STRATEGIES.may_load(deps.storage, &addr)?;
    Ok(StrategyResponse { address, strategy })
}

pub fn query_all_strategies(deps: Deps) -> StdResult<Vec<StrategyResponse>> {
    let strategies = STRATEGIES
        .range(deps.storage, None, None, cosmwasm_std::Order::Ascending)
        .map(|item| {
            let (addr, strategy) = item?;
            Ok(StrategyResponse {
                address: addr.to_string(),
                strategy: Some(strategy),
            })
        })
        .collect::<StdResult<Vec<StrategyResponse>>>()?;
    Ok(strategies)
}
