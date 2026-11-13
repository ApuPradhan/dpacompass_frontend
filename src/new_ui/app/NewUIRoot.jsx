
import NewUIProvider from "./NewUIProvider";
import NewUIRoutes from "./NewUIRoutes";

const NewUIRoot = () => {
    return (
        <div className="new-ui-root">
            <NewUIProvider>
                <NewUIRoutes />
            </NewUIProvider>
        </div>
    );
};

export default NewUIRoot;
