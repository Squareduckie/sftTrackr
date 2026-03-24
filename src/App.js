import { Flex } from "antd";
import SFTForm from "./components/SFTForm/SFTForm";
import logo from "./assets/30SCE_LOGO.jpeg";

import "./App.css";

const App = () => {
  return (
    <Flex gap="middle" align="start" vertical>
      <Flex className="App-titleStyle" justify="center" align="center">
        <div className="App-titleInner">
          <img className="App-logo" src={logo} alt="logo" />
                  <h1>SFT TRACKER</h1>
        </div>
      </Flex>
      <Flex className="App-FlexBoxStyle" justify="center" align="center">
        <SFTForm />
      </Flex>
    </Flex>
  );
};

export default App;
