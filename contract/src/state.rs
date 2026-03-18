use cosmwasm_std::Addr;
use cw_storage_plus::Map;

use crate::msg::Strategy;

pub const STRATEGIES: Map<&Addr, Strategy> = Map::new("strategies");
