type ErrorMessageProps = {
    message: string;
};

export default function ErrorMessage({ message }: ErrorMessageProps){
    return(
        <div className="alert alert-danger mt-4">{message}</div>
    );
}
